declare global {
  interface Window {
    FB?: {
      getLoginStatus: (callback: (response: any) => void) => void
      init: (params: any) => void
      XFBML?: {
        parse: () => void
      }
    }
  }
}

export {}

