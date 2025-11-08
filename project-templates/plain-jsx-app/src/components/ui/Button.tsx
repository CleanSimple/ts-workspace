import type { FunctionalComponent, ParentComponent } from '@cleansimple/plain-jsx';
import './Button.css';

interface ButtonProps extends ParentComponent {
    onClick?: () => void;
}

const Button: FunctionalComponent<ButtonProps> = ({ children, onClick }) => {
    return <button class='button' on:click={onClick}>{children}</button>;
};

export { Button };
