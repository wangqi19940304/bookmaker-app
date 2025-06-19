import { Modal, Image } from 'antd';
function SeasonBadgeModal({badgeData, isOpen, onClose}) {
  return (
    <Modal open={isOpen} onCancel={onClose} footer={null}>
      <Image src={badgeData} preview={false} alt="Season Badge" style={{ width: '100%', height: '100%' }} />
    </Modal>
  )
}

export default SeasonBadgeModal;