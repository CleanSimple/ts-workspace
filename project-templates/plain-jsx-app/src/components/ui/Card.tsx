import type { FunctionalComponent, ParentComponent } from '@cleansimple/plain-jsx';
import './Card.css';

const Card: FunctionalComponent<ParentComponent> = ({ children }) => {
    return <div class='card'>{children}</div>;
};

export { Card };
