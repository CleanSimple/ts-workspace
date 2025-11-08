import type { FunctionalComponent, ParentComponent } from '@cleansimple/plain-jsx';
import './Header.css';

interface HeaderProps extends ParentComponent {
}

const Header: FunctionalComponent<HeaderProps> = ({ children }) => {
    return <span class='header'>{children}</span>;
};

export { Header };
