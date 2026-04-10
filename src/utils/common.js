function cleanObject(obj) {
  return Object.fromEntries(
    Object.entries(obj).filter(([key, value]) => {
      // 这里定义什么算作“空”：null, undefined, 或 空字符串
      return value !== null && value !== undefined && value !== "";
    })
  );
}

export default cleanObject
