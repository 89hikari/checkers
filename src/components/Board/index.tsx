import { useState } from 'react'
import styles from './assets/styles/Board.module.scss'

// I'm gonna import classnames soon but now im too lazy
const cx = (...classes: string[]) => {
    return classes.map(el => styles[el]).join(' ');
}

const Board = () => {
    return (
        <div className={styles.board}>
            {[...Array(8).keys()].map((row) =>
                <div key={row} className={styles.row}>
                    {[...Array(8).keys()].map((cell) => <div key={cell} className={cx('cell', 'piece', 'white')}></div>)}
                </div>
            )}
        </div>
    )
}

export default Board
