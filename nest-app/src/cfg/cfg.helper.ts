import { plainToInstance } from 'class-transformer'
import { validateSync } from 'class-validator'

export type ValidateEnvFn = (
   config: Record<string, unknown>,
) => Record<string, unknown>

export const validate =
   (envSchema): ValidateEnvFn =>
   (config) => {
      const validatedConfig = plainToInstance(envSchema, config, {
         enableImplicitConversion: true,
      })
      const errors = validateSync(validatedConfig as object, {
         skipMissingProperties: false,
      })

      if (errors.length > 0) {
         throw new Error(errors.toString())
      }

      return validatedConfig as Record<string, unknown>
   }
