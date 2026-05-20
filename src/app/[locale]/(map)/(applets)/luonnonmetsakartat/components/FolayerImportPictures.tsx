'use client'

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
  Autocomplete,
  TextField,
  Tooltip,
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
  const itemSize = 36 // height to match body7 rows
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
  const [rowOrder, setRowOrder] = useState<string[]>([])

  const areaConf: FolayerAreaConf | undefined = useAppletStore(
    (s) => s.folayerAreaConfs[folayerId]
  )

  // Memoized area options and lookups
  type AreaOption = {
    id: string
    label: string
    municipality: string
    name: string
  }
  const features = areaConf?.data?.features ?? []
  const areaOptionsAll: AreaOption[] = useMemo(() => {
    const list = features
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
      .filter((o): o is AreaOption => !!o)
      .sort((a, b) => {
        const am = normalize(a.municipality)
        const bm = normalize(b.municipality)
        if (am !== bm) return am.localeCompare(bm)
        const an = normalize(a.name)
        const bn = normalize(b.name)
        return an.localeCompare(bn)
      })
    return list
  }, [features])
  const optionsById = useMemo(
    () => new Map(areaOptionsAll.map((o) => [o.id, o] as const)),
    [areaOptionsAll]
  )
  const featureIdByNormKey = useMemo(() => {
    const map = new Map<string, string>()
    for (const feat of features) {
      const id =
        feat.id != null
          ? String(feat.id)
          : feat.properties?.id != null
          ? String(feat.properties.id)
          : undefined
      if (!id) continue
      const municipality = normalize(feat.properties?.municipality)
      const name = normalize(feat.properties?.name)
      const key = `${municipality}|${name}`
      if (!map.has(key)) map.set(key, id)
    }
    return map
  }, [features])

  // Group files by bottom-level folder
  const groups = useMemo(() => {
    const map = new Map<string, File[]>()
    for (const f of files) {
      if (!f.type || !f.type.startsWith('image/')) continue
      const rel = (f as any).webkitRelativePath || f.name
      const parts = rel.split('/')
      const folder = parts.length > 1 ? parts[parts.length - 2] : ''
      if (!map.has(folder)) map.set(folder, [])
      map.get(folder)!.push(f)
    }
    return map
  }, [files])

  // Build mapping
  const mapping = useMemo(() => {
    const result: { bulkImages: File[]; bulkAreaIds: string[] } = {
      bulkImages: [],
      bulkAreaIds: [],
    }
    const unmatched: string[] = []
    const resolvedByFolder: Record<string, string | undefined> = {}

    if (!features.length) return { ...result, unmatched, resolvedByFolder }

    groups.forEach((imgs, folderName) => {
      if (!folderName) return
      const split = folderName.split(',')
      const municipalityRaw = split.shift()
      const nameRaw = split.join(',')

      const nMunicipality = normalize(municipalityRaw)
      const nName = normalize(nameRaw)
      const autoFoundId = featureIdByNormKey.get(`${nMunicipality}|${nName}`)

      const manual = manualMappings[folderName]
      let resolvedId: string | undefined

      if (manual === null) {
        resolvedId = undefined
      } else if (typeof manual === 'string' && manual) {
        resolvedId = manual
      } else if (autoFoundId) {
        resolvedId = autoFoundId
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
  }, [groups, featureIdByNormKey, manualMappings, features.length])

  // Initial row order (unmatched first, then alpha), only when groups change
  useEffect(() => {
    const folders = Array.from(groups.keys())
    if (folders.length === 0) {
      setRowOrder([])
      return
    }
    if (!features.length) return

    const prevSet = new Set(rowOrder)
    const sameSet =
      rowOrder.length > 0 &&
      rowOrder.length === folders.length &&
      folders.every((f) => prevSet.has(f))
    if (sameSet) return

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
      autoResolvedByFolder[folderName] = featureIdByNormKey.has(
        `${nMunicipality}|${nName}`
      )
    })

    const sorted = folders.sort((a, b) => {
      const aUnmatched = !autoResolvedByFolder[a]
      const bUnmatched = !autoResolvedByFolder[b]
      if (aUnmatched === bUnmatched) return a.localeCompare(b)
      return aUnmatched ? -1 : 1
    })

    setRowOrder(sorted)
  }, [groups, features.length, featureIdByNormKey])

  // Always reflect current validity
  useEffect(() => {
    if (!onValidationChange) return
    const isValid = mapping.bulkImages.length > 0 && !!areaConf
    onValidationChange(isValid)
  }, [onValidationChange, mapping.bulkImages.length, areaConf])

  useImperativeHandle(ref, () => ({
    getValues: (cb) => {
      // Allow partial saves: return mapped images even if some folders are unmatched
      if (mapping.bulkImages.length === 0) {
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
    // Replace previous selection entirely
    setManualMappings({})
    setFiles(arr)
    // Label from top-level of the latest selection
    const first = arr[0] as any
    const relFirst: string = first?.webkitRelativePath || first?.name || ''
    const root = relFirst.includes('/') ? relFirst.split('/')[0] : relFirst
    setSelectedFolderLabel(root || undefined)
    e.target.value = ''
  }

  const totalImages = mapping.bulkImages.length
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

  // Virtualized rows
  const rowHeight = 56
  const maxListHeight = 500
  const listHeight = Math.min(rowOrder.length * rowHeight, maxListHeight)

  const Row = ({ index, style }: ListChildComponentProps) => {
    const folder = rowOrder[index]
    const imgs = groups.get(folder) || []
    const count = imgs.length
    const manualVal = manualMappings[folder]
    const currentId =
      manualVal === null
        ? undefined
        : manualVal || mapping.resolvedByFolder[folder]
    const currentValue = currentId ? optionsById.get(currentId) || null : null

    return (
      <Box
        key={folder}
        style={style}
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
        <Tooltip title={folder} placement="top-start" enterDelay={200} arrow>
          <Typography
            typography="body7"
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {folder}
          </Typography>
        </Tooltip>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ textAlign: 'right' }}
        >
          {count}
        </Typography>
        <Autocomplete
          size="small"
          options={areaOptionsAll}
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
              {t('sidebar.admin.folayer.settings.picture.no_options')}
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
              [folder]: newValue ? newValue.id : null,
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
  }

  return (
    <Box>
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

      {groups.size > 0 && features.length ? (
        <Box sx={{ mt: 2 }}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: '1fr auto 1.5fr',
              alignItems: 'center',
              gap: 2,
              py: 0.75,
              borderBottom: '1px solid',
              borderColor: 'divider',
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

          <Box sx={{ width: '100%' }}>
            <FixedSizeList
              height={listHeight}
              itemCount={rowOrder.length}
              itemSize={rowHeight}
              width="100%"
            >
              {Row}
            </FixedSizeList>
          </Box>
        </Box>
      ) : null}
    </Box>
  )
})

export default FolayerImportPictures
