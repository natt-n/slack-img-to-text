import { useEffect, useState } from "react";
import { createWorker } from "tesseract.js";
import { Row, Col, Card, Progress, Select, message, Button } from 'antd';
import "./index.css";

const POC_OCR = () => {
  const [ocr, setOcr] = useState("");
  const [imageData, setImageData] = useState(null);

  const [progress, setProgress] = useState(0);
  const worker = createWorker({
    logger: (m) => {
      console.log(m);
      setProgress(parseInt(m.progress * 100));
    },
  });

  const convertImageToText = async () => {
    if (!imageData) return;
    await worker.load();
    await worker.loadLanguage("eng");
    await worker.initialize("eng");
    const {
      data: { text },
    } = await worker.recognize(imageData);
    setOcr(text);
  };

  useEffect(() => {
    convertImageToText();
  }, [imageData]);

  function handleImageChange(e) {
    const file = e.target.files[0];
    if(!file)return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const imageDataUri = reader.result;
      console.log({ imageDataUri });
      setImageData(imageDataUri);
    };
    reader.readAsDataURL(file);
  }

  const [copySuccess, setCopySuccess] = useState('');
  const handleCopy = async () => {
    try {
        await navigator.clipboard.writeText(imageData || '');
        setCopySuccess('Text copied!');
    } catch (err) {
        setCopySuccess('Failed to copy text.');
    }
};

  return (
    <div className="App">
      <div>
        <p>Choose an Image</p>
        <input
          type="file"
          name=""
          id=""
          onChange={handleImageChange}
          accept="image/*"
        />
      </div>
      {progress < 100 && progress > 0 && <div>
        <div className="progress-label">Progress ({progress}%)</div>
        <div className="progress-bar">
          <div className="progress" style={{width: `${progress}%`}} ></div>
        </div>
      </div>}
      <div className="display-flex">
        <img src={imageData} alt="" srcset="" />
        <p>{ocr}</p>
        {ocr && (
                        <div style={{ textAlign: 'center', marginTop: '20px' }}>
                            <Button onClick={handleCopy}>Copy Text</Button>
                            {copySuccess && <p style={{ color: 'green' }}>{copySuccess}</p>}
                        </div>
                    )}
      </div>
    </div>
  );
}

export default POC_OCR;