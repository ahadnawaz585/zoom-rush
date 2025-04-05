declare module "threads" {
    export function spawn(worker: any): any;
    export class Pool<T> {
      constructor(factory: () => Promise<T>, size?: number);
      queue(task: (worker: T) => Promise<any>): Promise<any>;
      terminate(): Promise<void>;
    }
    export class Worker {
      constructor(fn: Function | string, options?: { eval?: boolean; workerData?: any });
    }
  }