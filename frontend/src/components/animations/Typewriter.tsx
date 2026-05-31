import { motion } from 'framer-motion';
import { useTypewriter } from '../../hooks/useTypewriter';

interface TypewriterProps {
  text: string;
  speed?: number;
  delay?: number;
  style?: React.CSSProperties;
}

export function Typewriter({ text, speed = 50, delay = 0, style }: TypewriterProps) {
  const { displayedText, isTyping } = useTypewriter({ text, speed, delay });

  return (
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      style={{
        ...style,
        display: 'inline-block',
        minHeight: '1.2em',
      }}
    >
      {displayedText}
      {isTyping && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity }}
          style={{
            display: 'inline-block',
            marginLeft: '2px',
          }}
        >
          |
        </motion.span>
      )}
    </motion.span>
  );
}
