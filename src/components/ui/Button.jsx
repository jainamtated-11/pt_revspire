import React from 'react'
import { twMerge } from 'tailwind-merge'

const Button = ({onClick, className, children, ...rest}) => {
  return (
    <button onClick={onClick} className={twMerge(className, " px-3 py-1.5 rounded-lg  border border-neutral-100 transition-all flex justify-center items-center")} {...rest}>
        {children}
    </button>
  )
}

export default Button