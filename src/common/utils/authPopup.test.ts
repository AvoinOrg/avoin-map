import {
  formatAuthPopupFeatures,
  getAuthPopupGeometry,
} from '#/common/utils/authPopup'

describe('auth popup geometry', () => {
  it('centers the desktop popup on the visible map viewport', () => {
    expect(
      getAuthPopupGeometry({
        availHeight: 900,
        availWidth: 1440,
        innerHeight: 800,
        innerWidth: 1280,
        outerHeight: 850,
        outerWidth: 1280,
        screenX: 0,
        screenY: 0,
        visibleMap: {
          width: 920,
          height: 800,
          centerX: 820,
          centerY: 400,
        },
      })
    ).toEqual({
      width: 375,
      height: 667,
      left: 633,
      top: 117,
    })
  })

  it('uses available screen dimensions for mobile viewports', () => {
    expect(
      getAuthPopupGeometry({
        availHeight: 812,
        availLeft: 0,
        availTop: 0,
        availWidth: 375,
        innerHeight: 812,
        innerWidth: 375,
      })
    ).toEqual({
      width: 375,
      height: 812,
      left: 0,
      top: 0,
    })
  })

  it('clamps desktop coordinates to the available screen', () => {
    expect(
      getAuthPopupGeometry({
        availHeight: 700,
        availLeft: 0,
        availTop: 0,
        availWidth: 800,
        innerHeight: 700,
        innerWidth: 800,
        screenX: 0,
        screenY: 0,
        visibleMap: {
          width: 300,
          height: 500,
          centerX: 760,
          centerY: 680,
        },
      })
    ).toEqual({
      width: 300,
      height: 500,
      left: 500,
      top: 200,
    })
  })

  it('formats window features for native popup opening', () => {
    const features = formatAuthPopupFeatures({
      width: 375,
      height: 667,
      left: 633,
      top: 117,
    })

    expect(features).toContain('width=375')
    expect(features).toContain('left=633')
  })
})
