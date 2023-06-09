import { useState } from 'react'
import styles from './assets/styles/Board.module.scss'

const Board = () => {
    return (
        <div className={styles.board}>
            {[...Array(8).keys()].map((row) =>
                <div key={row} className={styles.row}>
                    {[...Array(8).keys()].map((cell) => <div key={cell} className={styles.cell}></div>)}
                </div>
            )}
        </div>
    )
}

export default Board
