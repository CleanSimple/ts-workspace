import { DefineRef } from './components/DefineRef';
import { FocusInputOnMount } from './components/FocusInputOnMount';
import { ForComponent } from './components/ForComponent';
import { Lifecycle } from './components/Lifecycle';
import { ShowComponent } from './components/ShowComponent';
import { Task } from './components/Task';
import { Watch } from './components/Watch';
import { WatchMany } from './components/WatchMany';
import { WithComponent } from './components/WithComponent';
import { WithManyComponent } from './components/WithManyComponent';
import './style.css';
import { render, type FunctionalComponent } from '@cleansimple/plain-jsx';

const App: FunctionalComponent = () => {
    return (
        <div>
            <ShowComponent />
            <ShowComponent keyed />
            <WithComponent />
            <WithManyComponent />
            <ForComponent />
            <Watch />
            <WatchMany />
            <Task />
            <FocusInputOnMount />
            <DefineRef />
            <Lifecycle />
        </div>
    );
};

const root = document.querySelector<HTMLDivElement>('#app')!;
render(root, <App />);
