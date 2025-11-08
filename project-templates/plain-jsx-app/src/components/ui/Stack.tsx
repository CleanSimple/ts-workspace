import type { FunctionalComponent, ParentComponent } from '@cleansimple/plain-jsx';
import './Stack.css';

interface StackProps extends ParentComponent {
    orientation?: 'horizontal' | 'vertical';
}

const Stack: FunctionalComponent<StackProps> = ({ orientation = 'vertical', children }) => {
    return (
        <div class={`${orientation[0]}-stack`}>
            {children}
        </div>
    );
};

export { Stack };
