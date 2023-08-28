export function racePromises<T>(promises: Promise<T>[]) {
  let resolved = false;
  let errors: any[] = [];
  let totalPromises = promises.length;

  return new Promise<T>((resolve, reject) => {
    for (const promise of promises) {
      promise
        .then((result) => {
          if (!resolved) {
            resolved = true;
            resolve(result);
          }
        })
        .catch((error: any) => {
          errors.push(error);
          if (errors.length === totalPromises) {
            reject(new Error(JSON.stringify(errors)));
          }
        });
    }
  });
}
