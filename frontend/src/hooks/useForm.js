import { useState } from "react";

const useForm = (initialValues = {}) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const setFieldValue = (name, value) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setValues(initialValues);
    setErrors({});
  };

  const setFieldError = (name, message) => {
    setErrors((prev) => ({ ...prev, [name]: message }));
  };

  return {
    values,
    errors,
    handleChange,
    setValues, // ✅ FIX: faltaba esto — todas las páginas lo usan para numero_tarjeta
    setFieldValue,
    setFieldError,
    resetForm,
    setErrors,
  };
};

export default useForm;
