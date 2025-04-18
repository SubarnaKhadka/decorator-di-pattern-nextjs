import "reflect-metadata";

export const INJECTABLE_METADATA_KEY = Symbol("INJECTABLE_KEY");
export const INJECT_METADATA_KEY = Symbol("INJECT_PROPERTY_KEY");
export const CONSTRUCTOR_PARAMS_KEY = Symbol("INJECT_CONSTRUCTOR_PARAMS");

export type Constructor<T = any> = new (...args: any[]) => T;

export function Injectable(): ClassDecorator {
  return (target: Function) => {
    Reflect.defineMetadata(INJECTABLE_METADATA_KEY, true, target);
  };
}

export function Inject(
  token?: string | symbol | Constructor
): ParameterDecorator & PropertyDecorator {
  return (
    target: Object,
    propertyKey: string | symbol | undefined,
    parameterIndex?: number
  ) => {
    if (typeof parameterIndex === "number") {
      const constructor = target as Constructor;
      const existingParams: (Constructor | string | symbol)[] =
        Reflect.getMetadata(CONSTRUCTOR_PARAMS_KEY, constructor) || [];
      existingParams[parameterIndex] =
        token ??
        Reflect.getMetadata("design:paramtypes", constructor)?.[parameterIndex];
      Reflect.defineMetadata(
        CONSTRUCTOR_PARAMS_KEY,
        existingParams,
        constructor
      );
    } else if (propertyKey !== undefined) {
      const constructor = target.constructor;
      const metadata: Array<{
        propertyKey: string | symbol;
        token: Constructor | string | symbol;
      }> = Reflect.getMetadata(INJECT_METADATA_KEY, constructor) || [];

      metadata.push({
        propertyKey,
        token: token ?? Reflect.getMetadata("design:type", target, propertyKey),
      });

      Reflect.defineMetadata(INJECT_METADATA_KEY, metadata, constructor);
    }
  };
}
