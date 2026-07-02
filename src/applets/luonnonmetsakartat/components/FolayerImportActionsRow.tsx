import { Box } from '#/common/style/theme'
import { Button } from '#/components/common/Button'
import TText from '#/components/common/TText'

const disabledButtonSelector =
  '&:disabled, &[data-disabled], &[aria-disabled="true"]'

const FolayerImportActionsRow = ({
  onClickAccept,
  isAcceptDisabled,
}: {
  onClickAccept: () => void
  isAcceptDisabled: boolean
}) => {
  return (
    <Box
      sx={{
        width: '100%',
        minHeight: '44px',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        pt: {
          mobile: 2.5,
          desktop: 3,
        },
        pb: {
          mobile: 7,
          desktop: 1.5,
        },
      }}
    >
      <Button
        type="button"
        variant="text"
        color="inherit"
        aria-label="Accept imported forest layer"
        disabled={isAcceptDisabled}
        onClick={isAcceptDisabled ? undefined : onClickAccept}
        sx={(theme) => ({
          minWidth: 0,
          minHeight: '34px',
          px: 0.75,
          py: 0.5,
          fontSize: '0.875rem',
          fontWeight: 600,
          lineHeight: 1.35,
          color: 'inherit',
          textDecoration: 'underline',
          textUnderlineOffset: '0.18em',
          textDecorationThickness: '0.08em',
          '&:hover': {
            backgroundColor: 'transparent',
            textDecoration: 'underline',
          },
          [disabledButtonSelector]: {
            opacity: 1,
            color: theme.palette.neutral.main,
            backgroundColor: 'transparent',
            borderColor: 'transparent',
          },
        })}
      >
        <TText keyName="sidebar.admin.create.accept" ns="luonnonmetsakartat" />
      </Button>
    </Box>
  )
}

export default FolayerImportActionsRow
