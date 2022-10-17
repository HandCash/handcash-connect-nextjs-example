import {CopyBlock, tomorrowNight} from "react-code-blocks";

const CodeSnippet = ({code}) => {
    return (
        <CopyBlock
            text={code}
            language={'js'}
            showLineNumbers={true}
            customStyle={{
                fontSize: '14px',
                fontFamily: 'monospace',
                padding: '12px',
                width: '800px',
                borderRadius: '12px'
            }}
            theme={tomorrowNight}
            codeBlock
        />
    );
};

export default CodeSnippet;
