import React, { useState } from "react";
import { BonificoModal } from "./modals/BonificoModal";

interface BonificoButtonProps {
    onTransactionComplete? : () => void;
}
export const BonificoButton : React.FC<BonificoButtonProps> = ({onTransactionComplete}) => {
    const [ isModalOpen, setIsModalOpen ] = useState<boolean>(false);
    return(
        <>
            <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white shadow-lg transition-all hover:bg-emerald-700 hover:shadow-xl active:scale-95"
            >
            Effettua Bonifico
            </button>

            <BonificoModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={onTransactionComplete}
            />
        </>
    );
}