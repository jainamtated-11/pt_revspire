import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React from 'react'

const FailureButton = ({onClickHandle, label , icon}) => {
  return (
    <>
            <button
               className="text-back border border-red-900   bg-red-200 hover:bg-red-300 focus:ring-1 font-medium focus:outline-none focus:ring-red-900 font-full rounded-full text-sm w-full sm:w-auto px-24 py-2 text-center dark"
              onClick={onClickHandle}
            >
              {icon && <FontAwesomeIcon icon={icon}   className="mr-2" />}
              {label}
            </button>
          </>
  )
}

export default FailureButton