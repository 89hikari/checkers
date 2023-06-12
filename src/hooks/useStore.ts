import { create, StateCreator } from 'zustand';
import { devtools } from 'zustand/middleware';

interface Slice {
    board: string[][],
    currentPlayer: string,
    move: (newRow: number, newCell: number, initialRow: number, initialCell: number) => void,
    changeSide: () => void,
    reset: () => void
}

const createSlice: StateCreator<Slice, [['zustand/devtools', never]], []> = (set, get) => ({
    board: [
        ['', 'w', '', 'w', '', 'w', '', 'w'],
        ['w', '', 'w', '', 'w', '', 'w', ''],
        ['', 'w', '', 'w', '', 'w', '', 'w'],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['b', '', 'b', '', 'b', '', 'b', ''],
        ['', 'b', '', 'b', '', 'b', '', 'b'],
        ['b', '', 'b', '', 'b', '', 'b', '']
    ],
    currentPlayer: 'b',
    move: (newRow: number, newCell: number, initialRow: number, initialCell: number) => {
        const board = get().board;
        let isBoss = board[initialRow][initialCell].length === 2;
        board[initialRow][initialCell] = '';
        const curPl = get().currentPlayer;
        board[newRow][newCell] = curPl;

        if ((newRow === 0 && curPl === 'b') || (newRow === 7 && curPl === 'w')) {
            board[newRow][newCell] = curPl + 'b';
        }

        if (isBoss) board[newRow][newCell] += 'b';

        const possibleEatenRow = Math.abs(newRow - initialRow) === 2;
        const possibleEatenCell = Math.abs(newCell - initialCell) === 2;

        if (possibleEatenRow && possibleEatenCell) {
            board[newRow > initialRow ? newRow - 1 : newRow + 1][newCell > initialCell ? newCell - 1 : newCell + 1] = '';
        }

        set({ board: board });
    },
    changeSide: () => set({ currentPlayer: get().currentPlayer === 'w' ? 'b' : 'w' }),
    reset: () => {
        set({
            board: [
                ['', 'w', '', 'w', '', 'w', '', 'w'],
                ['w', '', 'w', '', 'w', '', 'w', ''],
                ['', 'w', '', 'w', '', 'w', '', 'w'],
                ['', '', '', '', '', '', '', ''],
                ['', '', '', '', '', '', '', ''],
                ['b', '', 'b', '', 'b', '', 'b', ''],
                ['', 'b', '', 'b', '', 'b', '', 'b'],
                ['b', '', 'b', '', 'b', '', 'b', '']
            ],
            currentPlayer: 'b'
        });
    }
})

const useStore = create<Slice>()(devtools((...a) => ({
    ...createSlice(...a)
})));

export default useStore;
