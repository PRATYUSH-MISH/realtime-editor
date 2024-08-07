import React, { useEffect, useRef } from 'react';
import CodeMirror from 'codemirror';

import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/dracula.css';

import 'codemirror/mode/javascript/javascript';
import 'codemirror/addon/edit/closetag';
import 'codemirror/addon/edit/closebrackets';
import ACTIONS from '../Actions';

const Editor = ({ socketRef, roomId, onCodeChange }) => {

  const editorRef = useRef(null);

  useEffect(() => {
    const initEditor =async () => {
      if (!editorRef.current) {
        editorRef.current = CodeMirror.fromTextArea(document.getElementById('realtimeEditor'), {
          mode: { name: 'javascript', json: true },
          theme: 'dracula',
          autoCloseTags: true,
          autoCloseBrackets: true,
          lineNumbers: true,
        });

        editorRef.current.on('change', (instance, changes) => {
          const { origin } = changes;
          const code = instance.getValue();
          onCodeChange(code);
          if (origin !== 'setValue' && socketRef.current) {
            socketRef.current.emit(ACTIONS.CODE_CHANGE, {
              roomId,
              code,
            });
          }
        });
      }
    };

    initEditor();

    if (socketRef.current) {
      const handleCodeChange = ({ code }) => {
        if (code !== null && editorRef.current) {
          editorRef.current.setValue(code);
        }
      };

      socketRef.current.on(ACTIONS.CODE_CHANGE, handleCodeChange);

      // Copy socketRef.current to a local variable
      const currentSocket = socketRef.current;

      return () => {
        if (currentSocket) {
          currentSocket.off(ACTIONS.CODE_CHANGE, handleCodeChange);
        }
        if (editorRef.current) {
          editorRef.current.toTextArea();
          editorRef.current = null;
        }
      };
    }
  }, [roomId, socketRef, onCodeChange]);

  return <textarea id="realtimeEditor"></textarea>;
};

export default Editor;
