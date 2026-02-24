import { Box, SxProps, Theme } from '@mui/material'

type Props = {
  sx?: SxProps<Theme>
}

// Exact Figma vectors from Energiakartta map-toggle icon (nodes 2838:65003 / 2838:65004).
// Paths and stroke widths are copied from exported SVG assets; placement matches the Figma group.
const MapPinGlobe = ({ sx }: Props) => (
  <Box
    component="svg"
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={24}
    fill="none"
    viewBox="0 0 24 24"
    sx={sx}
  >
    <g transform="translate(1.375 0.59145)">
      <g transform="translate(-0.3 4.95)">
        <path
          d="M0.300008 8.78072H17.8671"
          stroke="currentColor"
          strokeWidth={0.6}
          strokeLinecap="round"
        />
        <path
          d="M17.8671 9.08358C17.8671 10.8574 17.3301 12.5897 16.3266 14.0524C15.3232 15.5151 13.9004 16.6397 12.2455 17.2783C10.5906 17.9168 8.78114 18.0394 7.05526 17.6297C5.32938 17.2201 3.76796 16.2976 2.57649 14.9835C1.38501 13.6694 0.619326 12.0253 0.380192 10.2677C0.141058 8.51008 0.439685 6.72123 1.23677 5.13659C2.03386 3.55194 3.29205 2.24576 4.84576 1.38994C6.39947 0.534124 8.1759 0.168777 9.94124 0.341981"
          stroke="currentColor"
          strokeWidth={0.6}
          strokeLinecap="round"
        />
        <path
          d="M2.11788 14.2329C2.78165 14.031 4.35704 13.6272 9.58228 13.6272C14.1597 13.6272 15.7187 14.031 16.0504 14.2329"
          stroke="currentColor"
          strokeWidth={0.6}
          strokeLinecap="round"
        />
        <path
          d="M11.2043 4.54C10.222 4.54 11.2052 4.53988 8.50209 4.53994C3.98406 4.54004 2.74816 4.03518 2.42074 3.63135"
          stroke="currentColor"
          strokeWidth={0.6}
          strokeLinecap="round"
        />
        <path
          d="M6.35714 9.08358C6.35714 5.72253 7.86902 2.09355 8.94027 0.503491C9.01189 0.397178 9.16298 0.391677 9.24407 0.490953C10.6583 2.22224 11.809 5.08645 11.809 9.08358C11.809 11.7976 11.0835 14.1699 10.3342 15.7976C9.8081 16.9403 8.42303 16.8966 7.91125 15.7474C7.09879 13.9231 6.35714 11.4376 6.35714 9.08358Z"
          stroke="currentColor"
          strokeWidth={0.6}
          strokeLinecap="round"
        />
      </g>
      <path
        d="M13 3.98921C13.0005 5.89377 14.9162 8.44164 16.3491 10.002C16.774 10.4647 17.4874 10.4776 17.9229 10.025C19.3152 8.57791 21.25 6.0913 21.25 3.98922C21.25 0.867512 19.0284 0.300053 16.8074 0.3C14.5864 0.299947 12.9994 1.71887 13 3.98921Z"
        stroke="currentColor"
        strokeWidth={0.6}
      />
      <path
        d="M17.4247 2.9331C18.2383 2.9331 18.8925 3.58535 18.8925 4.3833C18.8925 5.18125 18.2383 5.83349 17.4247 5.83349C16.6113 5.83335 15.9569 5.18116 15.9569 4.3833C15.9569 3.58544 16.6113 2.93325 17.4247 2.9331Z"
        stroke="currentColor"
        strokeWidth={0.6}
      />
    </g>
  </Box>
)

export default MapPinGlobe
