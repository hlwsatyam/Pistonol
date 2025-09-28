export const validateDepartmentCode = (form, editingId) => ({
  validator(_, value) {
    if (!value) return Promise.reject();

    // Check if code is unique (excluding current department if editing)
    return form.validateFields(["branch"]).then(({ branch }) => {
      
      const departments = JSON.parse(
        localStorage.getItem("departments") || "[]"
      );
      const exists = departments.some(
        (dept) =>
          dept.code === value &&
          dept.branch === branch &&
          dept._id !== editingId
      );

      if (exists) {
        return Promise.reject("Code must be unique within the branch");
      }
      return Promise.resolve();
    });
  },
});

export const validateDepartmentName = (form, editingId) => ({
  validator(_, value) {
    if (!value) return Promise.reject();

    // Check if name is unique (excluding current department if editing)
    return form.validateFields(["branch"]).then(({ branch }) => {
      // In a real app, you would make an API call to validate uniqueness
      const departments = JSON.parse(
        localStorage.getItem("departments") || "[]"
      );
      const exists = departments.some(
        (dept) =>
          dept.name === value &&
          dept.branch === branch &&
          dept._id !== editingId
      );

      if (exists) {
        return Promise.reject("Name must be unique within the branch");
      }
      return Promise.resolve();
    });
  },
});
