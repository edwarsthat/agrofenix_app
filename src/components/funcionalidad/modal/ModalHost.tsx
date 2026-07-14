import { useModalStore } from "../../../store/useModalStore";
import Modal from "./Modal";

export function ModalHost() {
    const { open, close, show, ...modalProps } = useModalStore();
    const { children, ...rest } = modalProps;

    return (
        <Modal open={open} onClose={close} {...rest} >
            {children}
        </Modal>
    )
}