// types/zoom.d.ts
declare global {
    interface Window {
      ZoomMtg: {
        setZoomJSLib: (path: string, dir: string) => void;
        preLoadWasm: () => void;
        prepareWebSDK: () => void;
        generateSDKSignature: (args: {
          meetingNumber: string;
          sdkKey: string;
          sdkSecret: string;
          role: number;
          success: (res: { result: string }) => void;
          error: (err: any) => void;
        }) => string;
        init: (args: {
          leaveUrl: string;
          success: () => void;
          error: (err: any) => void;
        }) => void;
        join: (args: {
          sdkKey: string;
          signature: string;
          meetingNumber: string;
          passWord: string;
          userName: string;
          success: () => void;
          error: (err: any) => void;
        }) => void;
      };
    }
  }
  
  export {};