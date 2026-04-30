import React from 'react'

const Button = ({ icon: Icon, text, className = '', onClick, type = 'button', disabled = false, ...props }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center justify-center gap-2 px-4 py-2 font-normal text-white text-sm bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${className}`}
      {...props}
    >
      {Icon && <Icon className="w-5 h-5" />}
      {text && <span>{text}</span>}
    </button>
  )
}

export default Button