import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Progress, Button, message } from 'antd';
import { FilePond } from 'react-filepond';
import { createWorker } from 'tesseract.js';
import Typo from 'typo-js';

const { Meta } = Card;

const Ocr = () => {
    const [img, setImg] = useState(null);
    const [imgUrl, setImgUrl] = useState(null); 
    const [text, setText] = useState(null);
    const [progress, setProgress] = useState({ pctg: 0, status: null });
    const [language, setLanguage] = useState(null);
    const [copySuccess, setCopySuccess] = useState('');
    const [formattedText, setFormattedText] = useState('');
    const dictionary = new Typo("en_US", false, false, { dictionaryPath: "./dictionaries" });

    const worker = createWorker({
        logger: m => {
            if (m.status === 'recognizing text') {
                const pctg = (m.progress / 1) * 100;
                setProgress({ ...progress, pctg: pctg.toFixed(2), status: m.status });
            }
        }
    });

    //if typo-js can be used. but it is very slow
    /*const formatWord = (word) => {
        word = word.trim();
    
        if (!dictionary.check(word)) {
            const suggestions = dictionary.suggest(word);
            if(suggestions.length > 0){
              return (suggestions[0]);
            } else {
              return word;
            }
        }
    
        return word;
      };*/
    
      const formatLine = (line) => { 
    
        const words = line.split(' ');
    
        for (let i = 0; i < words.length; i++) {
            
            if (/^[^a-zA-Z0-9]*$/.test(words[i])) { //if word is not alphanumeric
                words[i] = "";
                console.log(words[i] + " is not alphanumeric");
            } else if (words[i].length === 1 && words[i] !== "I") {
                words[i] = "";
                console.log(words[i] + " is a single character");
            } else {
                break;
            }
        }
          
          // Join words with spaces and return
          return words.join(' ');
    
        };
    
      const formatText = () => {
        if(!text){return;}

        // Split text into lines
        const lines = text.split('\n');
        
        // Map through each line
        const formattedLines = lines.map(line => {
          //if it has name or timestamp, add extra line
          if(/(?=.*\b[A-Z][a-z]*\b)(?=.*\b\d{1,2}:\d{2}(?:[ap]m)?\b)/.test(formatLine(line))){
            return  "<br /><b>" + formatLine(line) + "</b>";
          }
    
          //if it has a week day and a date (18th for example)
          if(/^(?=.*\b[A-Z][a-z]*\b)(?=.*\b\d{1,2}(?:st|nd|rd|th)\b)/.test(formatLine(line))){
            return  "<br /><b><u>" + formatLine(line) + "</u></b>";
          }
    
          return ">> " + formatLine(line);
        });
        
        const formatted = formattedLines.join('<br />');
        
        setFormattedText(formatted);
      };

    const handleOcr = async () => {
        if (img) {
            setText(null);
            setProgress({ pctg: 0, status: null });
            await worker.load();
            await worker.loadLanguage(language);
            await worker.initialize(language);
            const { data: { text } } = await worker.recognize(img);
            setText(text || '');
            console.log(text); 
            await worker.terminate();
        }
    };

    const resetAll = () => {
        setImg(null);
        setImgUrl(null);
        setText(null);
        setProgress({ pctg: 0, status: null });
        setLanguage(null);
        setFormattedText('');
    };

    useEffect(() => {
        if (language === null) {
            message.error('Upload image to generate text');
        } else if (img) {
            handleOcr();
        }
    }, [img, language]);

    useEffect(() => {
        if(text){
            formatText();
        }
    }, [text]);

    const handleFileAdd = (err, file) => {
        if (file) {
            setImg(file.file);
            setImgUrl(URL.createObjectURL(file.file));
            setLanguage('eng');
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
