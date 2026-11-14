function FormField({
  id,
  label,
  type = 'text',
  placeholder,
  autoComplete,
  trailing,
}) {
  return (
    <div className="form-field">
      <label className="form-field__label" htmlFor={id}>
        {label}
      </label>
      <div className="form-field__control">
        <input
          className="form-field__input"
          id={id}
          name={id}
          type={type}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required
        />
        {trailing}
      </div>
    </div>
  )
}

export default FormField
