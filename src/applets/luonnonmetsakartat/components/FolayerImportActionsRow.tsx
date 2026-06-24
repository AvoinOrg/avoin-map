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
        minHeight: '25px',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-end',
        margin: '40px 0 60px 0',
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
          minHeight: 'auto',
          p: 0,
          typography: 'h3',
          color: 'inherit',
          textDecoration: 'underline',
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
        <TText keyName="sidebar.create.accept" ns="hiilikartta" />
      </Button>
    </Box>
  )
}

export default FolayerImportActionsRow
