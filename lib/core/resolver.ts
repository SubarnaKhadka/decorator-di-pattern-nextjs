import {
    Constructor,
    CONSTRUCTOR_PARAMS_KEY,
    INJECT_METADATA_KEY,
    INJECTABLE_METADATA_KEY,
  } from "./di";
  
  const container = new Map<Constructor, any>();
  
  export function resolve<T>(Target: Constructor<T>): T {
    if (container.has(Target)) {
      return container.get(Target);
    }
  
    const isInjectable = Reflect.getMetadata(INJECTABLE_METADATA_KEY, Target);
    if (!isInjectable) {
      throw new Error(`Class ${Target.name} is not marked as @Injectable`);
    }
  
    const paramTypes: any[] =
      Reflect.getMetadata("design:paramtypes", Target) || [];
    const paramTokens: (Constructor | string | symbol)[] =
      Reflect.getMetadata(CONSTRUCTOR_PARAMS_KEY, Target) || [];
    const resolvedParams = paramTypes.map((_, index) => {
      const token = paramTokens[index] || paramTypes[index];
      return resolve(token as Constructor);
    });
  
    const instance = new Target(...resolvedParams);
  
    const injectProps: Array<{
      propertyKey: string | symbol;
      token: Constructor | string | symbol;
    }> = Reflect.getMetadata(INJECT_METADATA_KEY, Target) || [];
  
    for (const { propertyKey, token } of injectProps) {
      if (typeof token === "function") {
        const dependency = resolve(token as Constructor);
        Object.defineProperty(instance, propertyKey, {
          value: dependency,
          writable: true,
        });
      } else {
        throw new Error(
          `Unsupported token type for property ${String(propertyKey)}`
        );
      }
    }
  
    container.set(Target, instance);
    return instance;
  }
  