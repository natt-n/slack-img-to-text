import React, { useState } from 'react';
import { Button, Input, Typography, Space, notification } from 'antd';
import { CopyOutlined } from '@ant-design/icons';

const { TextArea } = Input;
const { Title } = Typography;

const TextFormatter = () => {
  const [text, setText] = useState('');
  const [formattedText, setFormattedText] = useState('');

  const handleTextChange = (e) => {
    setText(e.target.value);
  };

  const formatText = () => {
    // Wrap text with bold tags
    const formatted = text
      .split('\n')
      .map(line => `<strong>${line}</strong>`)
      .join('<br />');
    
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
      <Title level={2}>Text Formatter with Ant Design</Title>
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
