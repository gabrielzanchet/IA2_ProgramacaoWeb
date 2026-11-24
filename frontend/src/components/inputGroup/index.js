const InputGroup = ({type, placeholder, name, onChange, label, value, ...rest}) => {
    return (
        <div className="input-group mb-3">
            <span className="input-group-text">{label}</span>
            <input
                className="form-control"
                type={type}
                placeholder={placeholder}
                name={name}
                value={value}
                onChange={onChange}
                {...rest}
            />
        </div>
    )
}

export default InputGroup;
