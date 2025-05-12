import React from 'react';
import '../styles/componentStyles/ConfirmDelete.scss';

const ConfirmDelete = ({ onConfirm, onCancel}) => {

    return (
        <div className='popup-overlay' onClick={(e) => e.stopPropagation()}>
            <div className='confirm-delete'>
            <p className='confirm-delete-body'>
                Are you sure you want to <br/> <span className='confirm-delete-body-uninstall'>UNINSTALL</span> this instance?
            </p>          
            <div className='confirm-delete-buttons'>
                    <div className='confirm-delete-button' onClick={onConfirm} style={{background: "#49a749"}}>
                        <p className='confirm-delete-button-text'> YES</p>
                    </div>
                    <div className='confirm-delete-button' onClick={onCancel} style={{background: "#ce4949"}}>
                        <p className='confirm-delete-button-text'> NO</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDelete;