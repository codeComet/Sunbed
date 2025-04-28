// import React, { useState } from 'react';
// import Modal from 'react-modal';
// import { Carousel } from 'react-responsive-carousel';
// import 'react-responsive-carousel/lib/styles/carousel.min.css';

// const ImageModalSlider = ({ isOpen, images, closeModal }) => {
//     const [selectedIndex, setSelectedIndex] = useState(0);

//     const handleSlideChange = (index) => {
//         setSelectedIndex(index);
//     };

//     return (
//         <Modal
//             isOpen={isOpen}
//             onRequestClose={closeModal}
//             contentLabel="Image Modal"
//             className="image-modal"
//             overlayClassName="image-modal-overlay"
//         >
//             <div className="modal-content">
//                 <Carousel
//                     showArrows={true}
//                     showThumbs={false}
//                     selectedItem={selectedIndex}
//                     onChange={handleSlideChange}
//                 >
//                     {images.map((image, index) => (
//                         <div key={index}>
//                             <img src={image} alt={`Image ${index + 1}`} />
//                         </div>
//                     ))}
//                 </Carousel>
//                 <button onClick={closeModal}>Close</button>
//             </div>
//         </Modal>
//     );
// };

// export default ImageModalSlider;
