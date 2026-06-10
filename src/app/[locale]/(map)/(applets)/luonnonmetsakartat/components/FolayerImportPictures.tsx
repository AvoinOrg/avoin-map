'use client'

import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react'
import BigMenuButton from '#/components/common/BigMenuButton'
import { Upload } from '#/components/icons'
import { Box } from '#/components/common/PandaBox'
import SimpleTooltip from '#/components/common/SimpleTooltip'
import TText from '#/components/common/TText'
import { useAppletStore } from '#/app/[locale]/(map)/(applets)/luonnonmetsakartat/state/appletStore'
import { FolayerAreaConf } from '../common/types'
import { useTranslate } from '@tolgee/react'
import { FixedSizeList, ListChildComponentProps } from 'react-window'

type FixedSizeListProps = {
  height: number
  itemCount: number
  itemSize: number
  width: string | number
  children: (props: ListChildComponentProps) => React.ReactNode
}

const TypedFixedSizeList =
  FixedSizeList as unknown as React.ComponentType<FixedSizeListProps>

const directoryInputProps = {
  webkitdirectory: '',
  directory: '',
} as React.InputHTMLAttributes<HTMLInputElement> & {
  webkitdirectory: string
  directory: string
}

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

type AreaOption = {
  id: string
  label: string
  municipality: string
  name: string
}

interface AreaPickerProps {
  options: AreaOption[]
  value: AreaOption | null
  placeholder: string
  noOptionsText: string
  ariaLabel: string
  onChange: (value: AreaOption | null) => void
}

const AreaPicker = ({
  options,
  value,
  placeholder,
  noOptionsText,
  ariaLabel,
  onChange,
}: AreaPickerProps) => {
  const listboxId = React.useId()
  const [query, setQuery] = useState(value?.label ?? '')
  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)

  const filteredOptions = useMemo(() => {
    const normalizedQuery = normalize(query)
    if (!normalizedQuery) {
      return options.slice(0, 80)
    }

    return options
      .filter((option) =>
        normalize(
          `${option.label} ${option.municipality} ${option.name}`
        ).includes(normalizedQuery)
      )
      .slice(0, 80)
  }, [options, query])

  const handleSelect = (option: AreaOption | null) => {
    onChange(option)
    setQuery(option?.label ?? '')
    setIsOpen(false)
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setIsOpen(true)
      setActiveIndex((prev) =>
        Math.min(prev + 1, Math.max(filteredOptions.length - 1, 0))
      )
      return
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex((prev) => Math.max(prev - 1, 0))
      return
    }

    if (event.key === 'Enter') {
      if (isOpen && filteredOptions[activeIndex]) {
        event.preventDefault()
        handleSelect(filteredOptions[activeIndex])
      }
      return
    }

    if (event.key === 'Escape') {
      event.preventDefault()
      if (query || value) {
        handleSelect(null)
      } else {
        setIsOpen(false)
      }
    }
  }

  return (
    <Box sx={{ position: 'relative', minWidth: 0 }}>
      <Box
        component="input"
        role="combobox"
        aria-label={ariaLabel}
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-autocomplete="list"
        value={query}
        placeholder={placeholder}
        onFocus={() => setIsOpen(true)}
        onChange={(event) => {
          setQuery(event.target.value)
          setActiveIndex(0)
          setIsOpen(true)
        }}
        onKeyDown={handleKeyDown}
        sx={{
          width: '100%',
          minWidth: 0,
          height: '2rem',
          border: '0.5px solid',
          borderColor: 'neutral.main',
          borderRadius: '999px',
          backgroundColor: 'background.main',
          boxShadow: 'inset 0px 0.5px 1px 0px #D9D9D9',
          color: 'neutral.darker',
          px: 1.5,
          typography: 'body7',
          outline: 0,
          '&::placeholder': {
            color: 'neutral.dark',
            opacity: 1,
          },
          '&:focus-visible': {
            outline: '2px solid',
            outlineColor: 'secondary.main',
            outlineOffset: '2px',
          },
        }}
      />
      {isOpen && (
        <Box
          id={listboxId}
          role="listbox"
          sx={{
            position: 'absolute',
            zIndex: 'popup',
            top: 'calc(100% + 0.25rem)',
            left: 0,
            right: 0,
            maxHeight: '14rem',
            overflowY: 'auto',
            backgroundColor: 'background.main',
            border: '0.5px solid',
            borderColor: 'neutral.main',
            borderRadius: '0.5rem',
            boxShadow: '0 8px 18px rgba(0, 0, 0, 0.18)',
            py: 0.5,
          }}
          onMouseDown={(event) => event.preventDefault()}
        >
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option, index) => (
              <Box
                key={option.id}
                component="button"
                type="button"
                role="option"
                aria-selected={value?.id === option.id}
                onClick={() => handleSelect(option)}
                onMouseEnter={() => setActiveIndex(index)}
                sx={{
                  width: '100%',
                  border: 0,
                  backgroundColor:
                    index === activeIndex ? 'action.hover' : 'transparent',
                  color: 'inherit',
                  textAlign: 'left',
                  cursor: 'pointer',
                  px: 1.5,
                  py: 0.75,
                  typography: 'body7',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                }}
              >
                {option.label}
              </Box>
            ))
          ) : (
            <Box sx={{ px: 1.5, py: 1, typography: 'body7' }}>
              {noOptionsText}
            </Box>
          )}
        </Box>
      )}
    </Box>
  )
}

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

  const areaConf: FolayerAreaConf | undefined = useAppletStore(
    (s) => s.folayerAreaConfs[folayerId]
  )

  // Memoized area options and lookups
  const features = useMemo(
    () => areaConf?.data?.features ?? [],
    [areaConf?.data?.features]
  )
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
      const rel =
        (f as File & { webkitRelativePath?: string }).webkitRelativePath ||
        f.name
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

  const rowOrder = useMemo(() => {
    const folders = Array.from(groups.keys())
    if (folders.length === 0) {
      return []
    }
    if (!features.length) return folders.sort((a, b) => a.localeCompare(b))

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

    return folders.sort((a, b) => {
      const aUnmatched = !autoResolvedByFolder[a]
      const bUnmatched = !autoResolvedByFolder[b]
      if (aUnmatched === bUnmatched) return a.localeCompare(b)
      return aUnmatched ? -1 : 1
    })
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
    const first = arr[0] as (File & { webkitRelativePath?: string }) | undefined
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
        style={style as React.CSSProperties}
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
        <SimpleTooltip title={folder} side="top" align="start">
          <Box
            component="span"
            sx={{
              typography: 'body7',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {folder}
          </Box>
        </SimpleTooltip>
        <Box
          component="span"
          sx={{
            textAlign: 'right',
            typography: 'caption',
            color: 'text.secondary',
          }}
        >
          {count}
        </Box>
        <AreaPicker
          key={`${folder}-${currentValue?.id ?? 'none'}`}
          options={areaOptionsAll}
          value={currentValue}
          placeholder={t('sidebar.admin.folayer.settings.picture.select_area')}
          noOptionsText={t(
            'sidebar.admin.folayer.settings.picture.no_options'
          )}
          ariaLabel={t('sidebar.admin.folayer.settings.picture.select_area')}
          onChange={(newValue) => {
            setManualMappings((prev) => ({
              ...prev,
              [folder]: newValue ? newValue.id : null,
            }))
          }}
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
          {...directoryInputProps}
          type="file"
          accept="image/*"
          onChange={handleFolderInput}
          ref={inputRef}
        />
        <Upload sx={{ width: '24px' }} />
      </BigMenuButton>

      {groups.size > 0 && (
        <Box sx={{ mt: 3 }}>
          <Box component="p" sx={{ typography: 'body2', m: 0 }}>
            <TText
              ns="luonnonmetsakartat"
              keyName={'sidebar.admin.folayer.settings.picture.areas'}
            />
            : {totalAreas} •{' '}
            <TText
              ns="luonnonmetsakartat"
              keyName={'sidebar.admin.folayer.settings.picture.images'}
            />
            : {totalImages}
          </Box>
        </Box>
      )}

      {unmatchedFolders.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Box
            component="p"
            sx={{ m: 0, typography: 'body2', color: 'error.main', mb: 1 }}
          >
            <TText
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
          </Box>
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
            <Box
              component="span"
              sx={{ typography: 'caption', color: 'text.secondary' }}
            >
              {t('sidebar.admin.folayer.settings.picture.folders')}
            </Box>
            <Box
              component="span"
              sx={{
                textAlign: 'left',
                typography: 'caption',
                color: 'text.secondary',
              }}
            >
              {t('sidebar.admin.folayer.settings.picture.images')}
            </Box>
            <Box
              component="span"
              sx={{ typography: 'caption', color: 'text.secondary' }}
            >
              {t('sidebar.admin.folayer.settings.picture.areas')}
            </Box>
          </Box>

          <Box sx={{ width: '100%' }}>
            <TypedFixedSizeList
              height={listHeight}
              itemCount={rowOrder.length}
              itemSize={rowHeight}
              width="100%"
            >
              {Row}
            </TypedFixedSizeList>
          </Box>
        </Box>
      ) : null}
    </Box>
  )
})

FolayerImportPictures.displayName = 'FolayerImportPictures'

export default FolayerImportPictures
