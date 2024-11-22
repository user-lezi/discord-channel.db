export default async function (
  n: string,
  func: (...args: any) => Promise<any> | any,
) {
  let start = performance.now();
  await func();
  let took = performance.now() - start;
  console.log(`${n} took ${(took / 1000).toFixed(3)}s`);
}
