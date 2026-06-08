export const css = () => 'panda-css'

export const cx = (...classNames: Array<string | undefined | false | null>) => {
  return classNames.filter(Boolean).join(' ')
}
