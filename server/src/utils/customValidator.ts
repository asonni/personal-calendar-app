import Ajv, { ValidateFunction } from 'ajv';
import addFormats from 'ajv-formats';

const ajv = new Ajv();
addFormats(ajv);

const compileSchema = (schema: any): ValidateFunction => {
  return ajv.compile(schema);
};

const validateSchema = (schema: any, data: any): boolean => {
  const validate = compileSchema(schema);
  return validate(data);
};

const getSchemaErrors = (schema: any, data: any): any => {
  const validate = compileSchema(schema);
  validate(data);
  return validate.errors;
};

export { validateSchema, getSchemaErrors };
