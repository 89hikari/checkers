import { useState } from 'react'
import useStore from 'app/hooks/useStore'
import classNames from 'classnames'
import styles from './assets/styles/Board.module.scss'

const setPieceClassnames = (pieceVal: string) => {
    return classNames(
        styles.cell,
        { [styles.piece]: !!pieceVal },
        { [styles.black]: pieceVal === 'b' },
        { [styles.white]: pieceVal === 'w' }
    )
}

const Board = () => {
    const board = useStore((state) => state.board);
    return (
        <div className={styles.board}>
            {board.map((row, i) =>
                <div key={i} className={styles.row}>
                    {row.map((cell, j) => <div key={`${cell}${j}`} className={setPieceClassnames(cell)}></div>)}
                </div>
            )}
        </div>
    )
}

export default Board
