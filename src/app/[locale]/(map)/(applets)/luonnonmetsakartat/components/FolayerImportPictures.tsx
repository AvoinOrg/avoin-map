import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react'
import {
  Box,
  Typography,
  List,
  ListItem,
  Chip,
  Divider,
  Autocomplete,
  TextField,
} from '@mui/material'
import BigMenuButton from '#/components/common/BigMenuButton'
import { Upload } from '#/components/icons'
import { useAppletStore } from '#/app/[locale]/(map)/(applets)/luonnonmetsakartat/state/appletStore'
import { FolayerAreaConf } from '../common/types'
import { T, useTranslate } from '@tolgee/react'
import { FixedSizeList, ListChildComponentProps } from 'react-window'

const LISTBOX_PADDING = 8 // px

function renderRow(props: ListChildComponentProps) {
  const { data, index, style } = props
  // data is the array of rendered options
  // `data[index]` is the rendered option, which is a `<li>` element
  // We're adding the style from react-window to it
  return React.cloneElement(data[index] as React.ReactElement, {
    style: {
      ...style,
      top: (style.top as number) + LISTBOX_PADDING,
    },
  })
}

const OuterElementContext = React.createContext({})

const OuterElementType = React.forwardRef<HTMLDivElement>((props, ref) => {
  const outerProps = React.useContext(OuterElementContext)
  return <div ref={ref} {...props} {...outerProps} />
})

const ListboxComponent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLElement>
>(function ListboxComponent(props, ref) {
  const { children, ...other } = props
  const itemData = React.Children.toArray(children)
  const itemCount = itemData.length
  const itemSize = 36 // Estimated height for 'body7' typography

  const height = Math.min(itemCount, 8) * itemSize

  return (
    <div ref={ref}>
      <OuterElementContext.Provider value={other}>
        <FixedSizeList
          itemData={itemData}
          height={height + 2 * LISTBOX_PADDING}
          width="100%"
          outerElementType={OuterElementType}
          innerElementType="ul"
          itemSize={itemSize}
          overscanCount={5}
          itemCount={itemCount}
        >
          {renderRow}
        </FixedSizeList>
      </OuterElementContext.Provider>
    </div>
  )
})

export interface FolayerImportPicturesValues {
  bulkImages: File[]
  bulkAreaIds: string[]
}

export interface FolayerImportPicturesRef {
  getValues: (
    callback: (values: FolayerImportPicturesValues | null) => void
  ) => void
}

interface FolayerImportPicturesProps {
  folayerId: string
  onValidationChange?: (isValid: boolean) => void
}

const normalize = (s?: string) =>
  (s || '').toString().trim().replace(/\s+/g, ' ').toLowerCase()

const FolayerImportPictures = forwardRef<
  FolayerImportPicturesRef,
  FolayerImportPicturesProps
>(({ folayerId, onValidationChange }, ref) => {
  const { t } = useTranslate('luonnonmetsakartat')
  const inputRef = useRef<HTMLInputElement>(null)
  const [files, setFiles] = useState<File[]>([])
  const [selectedFolderLabel, setSelectedFolderLabel] = useState<string>()
  const [manualMappings, setManualMappings] = useState<
    Record<string, string | null | undefined>
  >({})
  // Persisted initial row order (by folder name), so manual changes don't re-order rows
  const [rowOrder, setRowOrder] = useState<string[]>([])
  // Track whether we've already signaled the parent that changes can be made
  const hasSignaledRef = useRef(false)

  const areaConf: FolayerAreaConf | undefined = useAppletStore(
    (s) => s.folayerAreaConfs[folayerId]
  )

  // Area folders by bottom-level folder name
  const groups = useMemo(() => {
    const map = new Map<string, File[]>()
    for (const f of files) {
      // Only images
      if (!f.type || !f.type.startsWith('image/')) continue
      const rel = (f as any).webkitRelativePath || f.name
      const parts = rel.split('/')
      const folder = parts.length > 1 ? parts[parts.length - 2] : ''
      if (!map.has(folder)) map.set(folder, [])
      map.get(folder)!.push(f)
    }
    return map
  }, [files])

  // Compute mapping from folder name "municipality, name" -> area id
  const mapping = useMemo(() => {
    const result: { bulkImages: File[]; bulkAreaIds: string[] } = {
      bulkImages: [],
      bulkAreaIds: [],
    }
    const unmatched: string[] = []
    const resolvedByFolder: Record<string, string | undefined> = {}

    if (!areaConf?.data?.features?.length) {
      return { ...result, unmatched, resolvedByFolder }
    }

    const features = areaConf.data.features

    groups.forEach((imgs, folderName) => {
      if (!folderName) return
      const split = folderName.split(',')
      const municipalityRaw = split.shift()
      const nameRaw = split.join(',') // allow commas in name after the first

      const nMunicipality = normalize(municipalityRaw)
      const nName = normalize(nameRaw)

      const autoFound = features.find((feat) => {
        const fName = normalize(feat.properties?.name)
        const fMunicipality = normalize(feat.properties?.municipality)
        return fName === nName && fMunicipality === nMunicipality
      })

      // Manual mapping takes precedence; null means explicitly cleared
      const manual = manualMappings[folderName]
      let resolvedId: string | undefined

      if (manual === null) {
        resolvedId = undefined
      } else if (typeof manual === 'string' && manual) {
        resolvedId = manual
      } else if (autoFound) {
        resolvedId =
          autoFound.id != null
            ? String(autoFound.id)
            : autoFound.properties?.id != null
            ? String(autoFound.properties.id)
            : undefined
      }

      if (!resolvedId) {
        unmatched.push(folderName)
        resolvedByFolder[folderName] = undefined
      } else {
        resolvedByFolder[folderName] = resolvedId
        for (const img of imgs) {
          result.bulkImages.push(img)
          result.bulkAreaIds.push(resolvedId)
        }
      }
    })

    return { ...result, unmatched, resolvedByFolder }
  }, [groups, areaConf, manualMappings])

  // Establish initial row order when a new selection (groups) is loaded; do not depend on manualMappings
  useEffect(() => {
    const folders = Array.from(groups.keys())
    if (folders.length === 0) {
      setRowOrder([])
      return
    }

    // Wait until areas are available to compute initial unmatched-first order
    if (!areaConf?.data?.features?.length) return

    // If the set of folders hasn't changed and we already have an order, do not reorder
    const prevSet = new Set(rowOrder)
    const sameSet =
      rowOrder.length > 0 &&
      rowOrder.length === folders.length &&
      folders.every((f) => prevSet.has(f))
    if (sameSet) return

    const features = areaConf.data.features

    // Determine auto-match status for initial ordering only
    const autoResolvedByFolder: Record<string, boolean> = {}
    folders.forEach((folderName) => {
      if (!folderName || features.length === 0) {
        autoResolvedByFolder[folderName] = false
        return
      }
      const split = folderName.split(',')
      const municipalityRaw = split.shift()
      const nameRaw = split.join(',')

      const nMunicipality = normalize(municipalityRaw)
      const nName = normalize(nameRaw)

      const autoFound = features.find((feat: any) => {
        const fName = normalize(feat.properties?.name)
        const fMunicipality = normalize(feat.properties?.municipality)
        return fName === nName && fMunicipality === nMunicipality
      })
      autoResolvedByFolder[folderName] = !!autoFound
    })

    const sorted = folders.sort((a, b) => {
      const aUnmatched = !autoResolvedByFolder[a]
      const bUnmatched = !autoResolvedByFolder[b]
      if (aUnmatched === bUnmatched) return a.localeCompare(b)
      return aUnmatched ? -1 : 1
    })

    setRowOrder(sorted)
  }, [groups, areaConf])

  // Report to parent: signal when at least one image is mapped to an area
  useEffect(() => {
    if (!onValidationChange) return
    const hasAtLeastOneMapped = mapping.bulkImages.length > 0 && !!areaConf
    if (hasAtLeastOneMapped && !hasSignaledRef.current) {
      onValidationChange(true)
      hasSignaledRef.current = true
    }
  }, [onValidationChange, mapping.bulkImages.length, areaConf])

  useImperativeHandle(ref, () => ({
    getValues: (cb) => {
      if (mapping.unmatched.length > 0 || mapping.bulkImages.length === 0) {
        cb(null)
        return
      }
      cb({ bulkImages: mapping.bulkImages, bulkAreaIds: mapping.bulkAreaIds })
    },
  }))

  const handleFolderInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fList = e.target.files
    if (!fList) return
    const arr = Array.from(fList)
    // reset signal when a new selection is made
    hasSignaledRef.current = false
    setFiles(arr)
    // Derive a label from the top-level selected folder
    const first = arr[0] as any
    const relFirst: string = first?.webkitRelativePath || first?.name || ''
    const root = relFirst.includes('/') ? relFirst.split('/')[0] : relFirst
    setSelectedFolderLabel(root || undefined)
    // reset input so same folder can be re-selected
    e.target.value = ''
  }

  const totalImages = mapping.bulkImages.length
  // Matched areas = unique area ids from mapping
  const matchedAreaIds = useMemo(
    () => new Set<string>(mapping.bulkAreaIds || []),
    [mapping.bulkAreaIds]
  )
  const totalAreas = matchedAreaIds.size
  const unmatchedFolders = mapping.unmatched
  const unmatchedFoldersCount = unmatchedFolders.length
  const unmatchedImagesCount = useMemo(() => {
    if (!unmatchedFolders.length) return 0
    let count = 0
    unmatchedFolders.forEach((folder) => {
      const imgs = groups.get(folder)
      if (imgs) count += imgs.length
    })
    return count
  }, [unmatchedFolders, groups])

  return (
    <Box
      sx={(theme) => ({
        backgroundColor: theme.palette.neutral.light,
        borderRadius: '0.3125rem',
      })}
    >
      {/* <Typography variant="h4" sx={{ mb: 3 }}>
        Upload pictures (folder or folder of folders)
      </Typography> */}
      <BigMenuButton
        variant="outlined"
        component="label"
        sx={{ width: '100%', minHeight: '60px' }}
      >
        {selectedFolderLabel ||
          t('sidebar.admin.folayer.settings.picture.select_folder')}
        <input
          hidden
          multiple
          // @ts-ignore non-standard attributes for directory selection
          webkitdirectory=""
          // @ts-ignore
          directory=""
          type="file"
          accept="image/*"
          onChange={handleFolderInput}
          ref={inputRef}
        />
        <Upload sx={{ width: '24px' }} />
      </BigMenuButton>

      {groups.size > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="body2">
            <T
              ns="luonnonmetsakartat"
              keyName={'sidebar.admin.folayer.settings.picture.areas'}
            />
            : {totalAreas} •{' '}
            <T
              ns="luonnonmetsakartat"
              keyName={'sidebar.admin.folayer.settings.picture.images'}
            />
            : {totalImages}
          </Typography>
        </Box>
      )}

      {unmatchedFolders.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="body2" color="error" sx={{ mb: 1 }}>
            <T
              ns="luonnonmetsakartat"
              keyName={
                unmatchedFoldersCount > 1
                  ? 'sidebar.admin.folayer.settings.picture.unmatched_folders'
                  : 'sidebar.admin.folayer.settings.picture.unmatched_folder'
              }
              params={{
                folderCount: unmatchedFoldersCount,
                imageCount: unmatchedImagesCount,
              }}
            />
          </Typography>
        </Box>
      )}

      {/* Mapping table: show all folders with searchable area selector. Unmatched first. */}
      {groups.size > 0 && areaConf?.data?.features?.length ? (
        <Box sx={{ mt: 2 }}>
          {/* Table header */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: '1fr auto 1.5fr',
              alignItems: 'center',
              gap: 2,
              py: 0.75,
              // removed header top border and highlight background per request
              // borderTop: '1px solid',
              borderBottom: '1px solid',
              borderColor: 'divider',
              // backgroundColor: 'action.hover',
            }}
          >
            <Typography variant="caption" color="text.secondary">
              {t('sidebar.admin.folayer.settings.picture.folders')}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ textAlign: 'left' }}
            >
              {t('sidebar.admin.folayer.settings.picture.images')}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {t('sidebar.admin.folayer.settings.picture.areas')}
            </Typography>
          </Box>

          {/* Scrollable rows container */}
          <Box sx={{ maxHeight: 300, overflowY: 'auto' }}>
            {rowOrder.map((folder) => {
              const imgs = groups.get(folder) || []
              const count = imgs.length
              const features = areaConf.data.features
              type AreaOption = {
                id: string
                label: string
                municipality: string
                name: string
              }
              const areaOptions: AreaOption[] = features
                .map((feat) => {
                  const id =
                    feat.id != null
                      ? String(feat.id)
                      : feat.properties?.id != null
                      ? String(feat.properties.id)
                      : undefined
                  if (!id) return null
                  const municipality = feat.properties?.municipality || ''
                  const name = feat.properties?.name || ''
                  const label = [municipality, name].filter(Boolean).join(', ')
                  return { id, label, municipality, name }
                })
                .filter(Boolean)
                // Order by municipality, then by name (case-insensitive, trimmed)
                .sort((a, b) => {
                  const am = normalize(a.municipality)
                  const bm = normalize(b.municipality)
                  if (am !== bm) return am.localeCompare(bm)
                  const an = normalize(a.name)
                  const bn = normalize(b.name)
                  return an.localeCompare(bn)
                }) as AreaOption[]

              const optionsMap = new Map(areaOptions.map((o) => [o.id, o]))
              const manualVal = manualMappings[folder]
              const currentId =
                manualVal === null
                  ? undefined
                  : manualVal || mapping.resolvedByFolder[folder]
              const currentValue = currentId
                ? optionsMap.get(currentId) || null
                : null

              return (
                <Box
                  key={folder}
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: '1fr auto 1.5fr',
                    alignItems: 'center',
                    gap: 2,
                    py: 1,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Typography
                    typography="body7"
                    sx={{ whiteSpace: 'normal', wordBreak: 'break-word' }}
                  >
                    {folder}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ textAlign: 'right' }}
                  >
                    {count}
                  </Typography>
                  <Autocomplete
                    size="small"
                    options={areaOptions}
                    value={currentValue}
                    isOptionEqualToValue={(o, v) => o.id === v.id}
                    getOptionLabel={(o) => o.label}
                    renderOption={(props, option) => (
                      <li {...props} key={option.id}>
                        <Typography typography="body7">{option.label}</Typography>
                      </li>
                    )}
                    noOptionsText={
                      <Typography typography="body7">
                        {t(
                          'sidebar.admin.folayer.settings.picture.no_options'
                        )}
                      </Typography>
                    }
                    slotProps={{
                      listbox: {
                        component: ListboxComponent as React.ComponentType<
                          React.HTMLAttributes<HTMLElement>
                        >,
                      },
                    }}
                    clearOnEscape
                    disableClearable={false}
                    onChange={(_e, newValue) => {
                      setManualMappings((prev) => ({
                        ...prev,
                        [folder]: newValue ? newValue.id : null, // null = explicitly cleared
                      }))
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        placeholder={t(
                          'sidebar.admin.folayer.settings.picture.select_area'
                        )}
                        sx={{
                          '& .MuiInputBase-input': (theme) => ({
                            typography: 'body7',
                          }),
                        }}
                      />
                    )}
                  />
                </Box>
              )
            })}
          </Box>
        </Box>
      ) : null}
    </Box>
  )
})

export default FolayerImportPictures
