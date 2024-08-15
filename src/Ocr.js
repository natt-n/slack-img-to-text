import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Progress, Select, Button, message } from 'antd';
import { FilePond } from 'react-filepond';
import { createWorker } from 'tesseract.js';

const { Meta } = Card;
const { Option } = Select;

const Ocr = () => {
    const [img, setImg] = useState(null);
    const [imgUrl, setImgUrl] = useState(null); // State to store image URL
    const [text, setText] = useState(null);
    const [progress, setProgress] = useState({ pctg: 0, status: null });
    const [language, setLanguage] = useState(null);
    const [copySuccess, setCopySuccess] = useState('');

    const worker = createWorker({
        logger: m => {
            if (m.status === 'recognizing text') {
                const pctg = (m.progress / 1) * 100;
                setProgress({ ...progress, pctg: pctg.toFixed(2), status: m.status });
            }
        }
    });

    const handleOcr = async () => {
        if (img) {
            setText(null);
            setProgress({ pctg: 0, status: null });
            await worker.load();
            await worker.loadLanguage(language);
            await worker.initialize(language);
            const { data: { text } } = await worker.recognize(img);
            setText(text);
            await worker.terminate();
        }
    };

    const resetAll = () => {
        setImg(null);
        setImgUrl(null); // Reset image URL
        setText(null);
        setProgress({ pctg: 0, status: null });
        setLanguage(null);
    };

    useEffect(() => {
        if (language === null) {
            message.error('Select your language');
        } else if (img) {
            handleOcr();
        }
    }, [img, language]);

    const handleFileAdd = (err, file) => {
        if (file) {
            setImg(file.file);
            setImgUrl(URL.createObjectURL(file.file)); // Create image URL
        }
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(text || '');
            setCopySuccess('Text copied!');
        } catch (err) {
            setCopySuccess('Failed to copy text.');
        }
    };

    return (
        <Row>
            <Col md={{ span: 12, offset: 6 }} sm={{ span: 22, offset: 1 }}>
                <br />
                <h1 align="center">Tesseract OCR</h1>
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
                    <Select
                        value={language}
                        showSearch
                        style={{ width: '100%' }}
                        placeholder="Select a language"
                        optionFilterProp="children"
                        onChange={e => setLanguage(e)}
                        filterOption={(input, option) =>
                            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                        }
                    >
                        <Option value="eng">English</Option>
                        <Option value="ara">Arabic</Option>
                        <Option value="fra">French</Option>
                        <Option value="ita">Italian</Option>
                        <Option value="jpn">Japanese</Option>
                    </Select>
                </Card>
            </Col>
            <div style={{ display: 'flex', alignItems: 'flex-start', margin: "10px"}}>
                    {imgUrl && <img src={imgUrl} alt="Preview" style={{
                                        width: '60%', // Adjust width to make the image smaller
                                        height: 'auto',
                                        maxWidth: '600px', // Optionally set a maximum width
                                        marginBottom: '20px',
                                    }} />}
                        {text && (
                            <div style={{ flex: 1 }}>
                                <Meta
                                    title="Text to convert"
                                    description={<pre style={{ textAlign: 'left', fontSize: "12px", color: "black"}}>{text}</pre>}
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
