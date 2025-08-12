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
    Record<string, string | undefined>
  >({})

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

      // Manual mapping takes precedence
      const manualId = manualMappings[folderName]
      let resolvedId: string | undefined = manualId
      if (!resolvedId && autoFound) {
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

  // Report validity: valid when we have at least one image and no unmatched areas (folders)
  useEffect(() => {
    if (!onValidationChange) return
    const isValid =
      (mapping.bulkImages.length > 0 || groups.size > 0) &&
      mapping.unmatched.length === 0 &&
      !!areaConf
    onValidationChange(isValid)
  }, [onValidationChange, mapping, groups.size, areaConf])

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
        <Box sx={{ mt: 3 }}>
          <Typography variant="body2" color="error" sx={{ mb: 1 }}>
            <T
              ns="luonnonmetsakartat"
              keyName={
                'sidebar.admin.folayer.settings.picture.unmatched_folders'
              }
              params={{
                folderCount: unmatchedFoldersCount,
                imageCount: unmatchedImagesCount,
              }}
            />
          </Typography>
          <List dense sx={{ maxHeight: 160, overflowY: 'auto', pl: 2 }}>
            {unmatchedFolders.map((g) => (
              <ListItem key={g} sx={{ py: 0.2 }}>
                <Chip
                  label={g}
                  size="small"
                  color="warning"
                  variant="outlined"
                />
              </ListItem>
            ))}
          </List>
        </Box>
      )}

      {totalAreas > 0 && unmatchedFolders.length === 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="success.main">
            All folders matched to areas.
          </Typography>
        </Box>
      )}

      {/* Mapping table: show all folders with searchable area selector. Unmatched first. */}
      {groups.size > 0 && areaConf?.data?.features?.length ? (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Folders ↔ Areas
          </Typography>
          {Array.from(groups.entries())
            .map(([folder, imgs]) => ({ folder, count: imgs.length }))
            .sort((a, b) => {
              const aUnmatched = !mapping.resolvedByFolder[a.folder]
              const bUnmatched = !mapping.resolvedByFolder[b.folder]
              if (aUnmatched === bUnmatched)
                return a.folder.localeCompare(b.folder)
              return aUnmatched ? -1 : 1
            })
            .map(({ folder, count }) => {
              const features = areaConf.data.features
              const areaOptions = features
                .map((feat) => {
                  const id =
                    feat.id != null
                      ? String(feat.id)
                      : feat.properties?.id != null
                      ? String(feat.properties.id)
                      : undefined
                  if (!id) return null
                  const labelParts = [
                    feat.properties?.municipality,
                    feat.properties?.name,
                  ]
                    .filter(Boolean)
                    .join(', ')
                  return { id, label: labelParts }
                })
                .filter(Boolean) as { id: string; label: string }[]

              const optionsMap = new Map(areaOptions.map((o) => [o.id, o]))
              const currentId =
                manualMappings[folder] || mapping.resolvedByFolder[folder]
              const currentValue =
                (currentId && optionsMap.get(currentId)) || null

              return (
                <Box
                  key={folder}
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: '1fr auto 1.5fr',
                    alignItems: 'center',
                    gap: 2,
                    py: 1,
                    borderTop: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Typography variant="body2">{folder}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {count} img
                  </Typography>
                  <Autocomplete
                    size="small"
                    options={areaOptions}
                    value={currentValue}
                    isOptionEqualToValue={(o, v) => o.id === v.id}
                    getOptionLabel={(o) => o.label}
                    onChange={(_e, newValue) => {
                      setManualMappings((prev) => ({
                        ...prev,
                        [folder]: newValue?.id,
                      }))
                    }}
                    renderInput={(params) => (
                      <TextField {...params} placeholder="Select area" />
                    )}
                  />
                </Box>
              )
            })}
        </Box>
      ) : null}
    </Box>
  )
})

export default FolayerImportPictures
