import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Progress, Button, message } from 'antd';
import { FilePond } from 'react-filepond';
import { createWorker } from 'tesseract.js';
import { formatText } from './utils/format_text.js'; // Import the formatting utility

const { Meta } = Card;

const Ocr = () => {
    const [img, setImg] = useState(null);
    const [imgUrl, setImgUrl] = useState(null); 
    const [text, setText] = useState('');
    const [formattedText, setFormattedText] = useState('');
    const [progress, setProgress] = useState({ pctg: 0, status: null });
    const [language, setLanguage] = useState('eng');
    const [copySuccess, setCopySuccess] = useState('');

    const worker = createWorker({
        logger: m => {
            if (m.status === 'recognizing text') {
                const pctg = (m.progress / 1) * 100;
                setProgress({ pctg: pctg.toFixed(2), status: m.status });
            }
        }
    });

    const handleOcr = async () => {
        if (img) {
            setText('');
            setProgress({ pctg: 0, status: null });
            await worker.load();
            await worker.loadLanguage(language);
            await worker.initialize(language);
            const { data: { text } } = await worker.recognize(img);
            setText(text || '');
            setFormattedText(formatText(text || ''));
            await worker.terminate();
        }
    };

    const resetAll = () => {
        setImg(null);
        setImgUrl(null);
        setText('');
        setFormattedText('');
        setProgress({ pctg: 0, status: null });
        setLanguage('eng');
    };

    useEffect(() => {
        if (language === null) {
            message.error('Upload image to generate text');
        } else if (img) {
            handleOcr();
        }
    }, [img, language]);

    const handleFileAdd = (err, file) => {
        if (file) {
            setImg(file.file);
            setImgUrl(URL.createObjectURL(file.file));
            setLanguage('eng');
        }
    };

    const handleCopy = async () => {
        try {
            const div = document.createElement('div');
            div.innerHTML = formattedText;
            document.body.appendChild(div);
            const range = document.createRange();
            range.selectNode(div);
            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
            document.execCommand('copy');
            document.body.removeChild(div);
            setCopySuccess('Text copied!');
        } catch (err) {
            setCopySuccess('Failed to copy text.');
        }
    };
    

    return (
        <Row>
            <Col md={{ span: 12, offset: 6 }} sm={{ span: 22, offset: 1 }}>
                <br />
                <h1 align="center">Tesseract.JS OCR</h1>
                <br />
                <Card
                    style={{ width: '100%' }}
                    cover={
                        <>
                            <FilePond
                                ref={ref => ref}
                                onaddfile={handleFileAdd}
                                onremovefile={() => { resetAll(); }}
                                style={{ height: '400px' }}
                            />
                        </>
                    }
                    actions={[
                        progress.pctg > 0 ? <Progress percent={progress.pctg} showInfo={false} /> : progress.status
                    ]}
                >
                </Card>
            </Col>
            <div style={{ display: 'flex', alignItems: 'flex-start', margin: "10px" }}>
                {imgUrl && <img src={imgUrl} alt="Preview" style={{
                                    width: '60%', // Adjust width to make the image smaller
                                    height: 'auto',
                                    maxWidth: '600px', // Optionally set a maximum width
                                    marginBottom: '20px',
                                }} />}
                {formattedText && (
                    <div style={{ flex: 1 }}>
                        <Meta
                            title="Text to convert"
                            description={<div dangerouslySetInnerHTML={{ __html: formattedText }} style={{ textAlign: 'left', fontSize: "12px", color: "black" }} />}
                        />
                        <div style={{ textAlign: 'left', marginTop: '20px' }}>
                            <Button onClick={handleCopy}>Copy Text</Button>
                            {copySuccess && <p style={{ color: 'green' }}>{copySuccess}</p>}
                        </div>
                    </div>
                )}
            </div>
        </Row>
    );
};

export default Ocr;
