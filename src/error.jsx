
// error box needs to disappear after memory is updated and working again.

// error box should also be called when value is not in the [0, 255] range. 

export function errorBox(err) {
    console.warn(err);

    return (
        <p style="visibility: hidden">NOP</p>
    )
}