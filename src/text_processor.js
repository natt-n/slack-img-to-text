import React, { useState } from 'react';
import { Button, Input, Typography, Space, notification } from 'antd';
import { CopyOutlined } from '@ant-design/icons';
import Typo from 'typo-js';

const { TextArea } = Input;
const { Title } = Typography;

const TextFormatter = () => {
  const [text, setText] = useState('');
  const [formattedText, setFormattedText] = useState('');
  const dictionary = new Typo("en_US", false, false, { dictionaryPath: "./dictionaries" });

  const handleTextChange = (e) => {
    setText(e.target.value);
  };

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
      //if word is not in dictionary, suggest a word;
      
      // map each word and update if needed
      /*const formattedWords = words.map((word) => {
        if(isName(word)){
          return word;
        }

        return formatWord(word);
      });*/
      
      // Join words with spaces and return
      return words.join(' ');

    };

  const formatText = () => {
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
  

  const copyToClipboard = () => {
    navigator.clipboard.writeText(text)
      .then(() => {
        notification.success({
          message: 'Copied to Clipboard',
          description: 'The formatted text has been copied to your clipboard.',
        });
      })
      .catch(err => {
        notification.error({
          message: 'Copy Failed',
          description: 'There was an issue copying the text to your clipboard.',
        });
      });
  };

  return (
    <div style={{ padding: '20px' }}>
      <Title level={2}>Text Formatter</Title>
      <TextArea
        rows={10}
        value={text}
        onChange={handleTextChange}
        placeholder="Enter your text here..."
        style={{ marginBottom: '10px' }}
      />
      <Space>
        <Button type="primary" onClick={formatText}>
          Format Text
        </Button>
        <Button
          type="default"
          icon={<CopyOutlined />}
          onClick={copyToClipboard}
        >
          Copy Text
        </Button>
      </Space>
      <hr />
      <Title level={4}>Formatted Output:</Title>
      <div
        dangerouslySetInnerHTML={{ __html: formattedText }}
        style={{ whiteSpace: 'pre-wrap', border: '1px solid #ddd', padding: '10px', borderRadius: '4px' }}
      />
    </div>
  );
};

export default TextFormatter;
