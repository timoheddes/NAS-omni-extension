export const OMNI_ASCII_LOGO = '⫷ ⦿ ⫸';

export const printToConsole = (text) => {
  console.log(
    `%c${OMNI_ASCII_LOGO} - Omni ${text}`,
    'color: #ffffffff; background: #2c3e50'
  );
};
