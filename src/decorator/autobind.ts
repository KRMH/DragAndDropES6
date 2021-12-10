/**
 * autobind decorator: This decorator is used to add .bind(this) to all needed fields
 * @param _ : the underscore is a mean to say we will not use this parameter but dont give an error for it
 * @param _2
 * @param descriptor
 * @returns
 */
export function autobind(_: any, _2: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;
  const adjstDescriptor: PropertyDescriptor = {
    configurable: true,
    get() {
      const boundFn = originalMethod.bind(this);
      return boundFn;
    },
  };
  return adjstDescriptor;
}
