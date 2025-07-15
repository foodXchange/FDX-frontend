export const validateComponent = (componentCode: string) => {
  const forbidden = [
    'className=',
    'style={{',
    'styled(',
    'makeStyles',
    'withStyles',
    '.css',
    '.scss',
    'import styles'
  ];
  
  forbidden.forEach(pattern => {
    if (componentCode.includes(pattern)) {
      throw new Error(`FORBIDDEN: ${pattern} found. Use MUI sx prop instead!`);
    }
  });
};