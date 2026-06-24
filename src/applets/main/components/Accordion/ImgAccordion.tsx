import React from 'react'
import { Accordion } from '@base-ui/react/accordion'

import type { ImageSource } from '#/common/types/image'
import { Box } from '#/common/style/theme/system'
import FrameworkImage from '#/components/common/FrameworkImage'

interface Props {
  title: string
  img: ImageSource
  children: React.ReactNode
}

const ACCORDION_ITEM_VALUE = 'main-img-accordion-item'
const ButtonBox = Box as React.ElementType

const ImgAccordion = ({ title, img, children }: Props) => {
  const [value, setValue] = React.useState<unknown[]>([])
  const isExpanded = value.includes(ACCORDION_ITEM_VALUE)

  return (
    <Accordion.Root
      value={value}
      onValueChange={setValue}
      render={(rootProps) => (
        <Box
          {...rootProps}
          sx={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,
            flex: isExpanded ? '0 0 auto' : '1 1 0%',
          }}
        />
      )}
    >
      <Accordion.Item
        value={ACCORDION_ITEM_VALUE}
        render={(itemProps) => (
          <Box
            {...itemProps}
            sx={{
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              minHeight: 0,
            }}
          />
        )}
      >
        <Accordion.Header
          render={(headerProps) => (
            <Box
              {...headerProps}
              component="h3"
              sx={{
                m: 0,
                display: 'flex',
                flexDirection: 'column',
                flex: isExpanded ? '0 0 5rem' : '1 1 0%',
                minHeight: '5rem',
              }}
            />
          )}
        >
          <Accordion.Trigger
            aria-label={`Toggle ${title}`}
            render={(triggerProps) => (
              <ButtonBox
                {...triggerProps}
                component="button"
                type="button"
                sx={{
                  position: 'relative',
                  overflow: 'hidden',
                  flex: '1 1 auto',
                  minHeight: 0,
                  width: '100%',
                  p: 0,
                  m: 0,
                  border: 0,
                  background: 'transparent',
                  color: 'inherit',
                  display: 'flex',
                  alignItems: 'center',
                  textAlign: 'left',
                  font: 'inherit',
                  cursor: 'pointer',
                  '&:focus-visible': {
                    outline: '2px solid',
                    outlineColor: 'secondary.dark',
                    outlineOffset: '-2px',
                  },
                }}
              >
                <FrameworkImage
                  src={img}
                  alt={title}
                  fill
                  style={{ objectFit: 'cover', zIndex: 0 }}
                  sizes="(max-width: 400px) 100vw"
                />
                <Box
                  className="white-fade"
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    backgroundImage:
                      'linear-gradient(to right, white 20%, transparent 80%)',
                    opacity: isExpanded ? 0 : 1,
                    transition: 'opacity 0.3s ease-in-out',
                    zIndex: 1,
                  }}
                />
                <Box
                  className="dark-fade"
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    backgroundImage:
                      'linear-gradient(to right, rgba(0,0,0,0.6) 30%, transparent 90%)',
                    opacity: isExpanded ? 1 : 0,
                    transition: 'opacity 0.3s ease-in-out',
                    zIndex: 1,
                  }}
                />
                <Box
                  component="span"
                  sx={{
                    zIndex: 2,
                    m: 0,
                    pl: 5,
                    pr: 5,
                    pt: 3,
                    pb: 3,
                    typography: 'h1',
                    fontSize: '0.75rem',
                    fontStyle: 'normal',
                    fontWeight: 700,
                    lineHeight: 'normal',
                    letterSpacing: '0.075rem',
                    textTransform: 'uppercase',
                    flexGrow: 1,
                    color: isExpanded ? 'common.white' : 'inherit',
                    transition: 'color 0.3s ease-in-out',
                  }}
                >
                  {title}
                </Box>
              </ButtonBox>
            )}
          />
        </Accordion.Header>
        <Accordion.Panel
          render={(panelProps) => (
            <Box
              {...panelProps}
              sx={{
                width: '100%',
                flex: '0 0 auto',
              }}
            />
          )}
        >
          <Box sx={{ width: '100%' }}>{children}</Box>
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion.Root>
  )
}

export default ImgAccordion
