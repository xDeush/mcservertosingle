// Minimal big-endian NBT reader/writer (Java Edition). Compounds are Maps of
// name -> {type, value}; lists are {elementType, items}.
(function(){
  const T = {END:0, BYTE:1, SHORT:2, INT:3, LONG:4, FLOAT:5, DOUBLE:6, BYTE_ARRAY:7,
             STRING:8, LIST:9, COMPOUND:10, INT_ARRAY:11, LONG_ARRAY:12};
  const dec = new TextDecoder('utf-8');
  const enc = new TextEncoder();

  function readString(view, offset){
    const len = view.getUint16(offset); offset += 2;
    const value = dec.decode(new Uint8Array(view.buffer, view.byteOffset + offset, len));
    return {value, offset: offset + len};
  }

  function readPayload(view, offset, type){
    let value;
    switch(type){
      case T.BYTE: value = view.getInt8(offset); offset += 1; break;
      case T.SHORT: value = view.getInt16(offset); offset += 2; break;
      case T.INT: value = view.getInt32(offset); offset += 4; break;
      case T.LONG: value = view.getBigInt64(offset); offset += 8; break;
      case T.FLOAT: value = view.getFloat32(offset); offset += 4; break;
      case T.DOUBLE: value = view.getFloat64(offset); offset += 8; break;
      case T.BYTE_ARRAY: {
        const len = view.getInt32(offset); offset += 4;
        value = new Int8Array(view.buffer, view.byteOffset + offset, len).slice();
        offset += len;
        break;
      }
      case T.STRING: { const r = readString(view, offset); value = r.value; offset = r.offset; break; }
      case T.LIST: {
        const elementType = view.getUint8(offset); offset += 1;
        const len = view.getInt32(offset); offset += 4;
        const items = [];
        for(let i = 0; i < len; i++){
          const r = readPayload(view, offset, elementType);
          items.push(r.value); offset = r.offset;
        }
        value = {elementType, items};
        break;
      }
      case T.COMPOUND: {
        value = new Map();
        for(;;){
          const t = view.getUint8(offset); offset += 1;
          if(t === T.END) break;
          const n = readString(view, offset); offset = n.offset;
          const p = readPayload(view, offset, t); offset = p.offset;
          value.set(n.value, {type: t, value: p.value});
        }
        break;
      }
      case T.INT_ARRAY: {
        const len = view.getInt32(offset); offset += 4;
        value = new Int32Array(len);
        for(let i = 0; i < len; i++){ value[i] = view.getInt32(offset); offset += 4; }
        break;
      }
      case T.LONG_ARRAY: {
        const len = view.getInt32(offset); offset += 4;
        value = [];
        for(let i = 0; i < len; i++){ value.push(view.getBigInt64(offset)); offset += 8; }
        break;
      }
      default: throw new Error('Unknown NBT tag type: ' + type);
    }
    return {value, offset};
  }

  function parse(bytes){
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    const type = view.getUint8(0);
    const n = readString(view, 1);
    const p = readPayload(view, n.offset, type);
    return {type, name: n.value, value: p.value};
  }

  class Writer{
    constructor(){ this.chunks = []; }
    push(size, fn){ const b = new Uint8Array(size); fn(new DataView(b.buffer)); this.chunks.push(b); }
    u8(v){ this.chunks.push(Uint8Array.of(v & 0xff)); }
    i16(v){ this.push(2, d => d.setInt16(0, v)); }
    u16(v){ this.push(2, d => d.setUint16(0, v)); }
    i32(v){ this.push(4, d => d.setInt32(0, v)); }
    i64(v){ this.push(8, d => d.setBigInt64(0, BigInt(v))); }
    f32(v){ this.push(4, d => d.setFloat32(0, v)); }
    f64(v){ this.push(8, d => d.setFloat64(0, v)); }
    str(s){ const e = enc.encode(s); this.u16(e.length); this.chunks.push(e); }
    toBytes(){
      const out = new Uint8Array(this.chunks.reduce((s, c) => s + c.length, 0));
      let off = 0;
      for(const c of this.chunks){ out.set(c, off); off += c.length; }
      return out;
    }
  }

  function writePayload(w, type, value){
    switch(type){
      case T.BYTE: w.u8(value < 0 ? value + 256 : value); break;
      case T.SHORT: w.i16(value); break;
      case T.INT: w.i32(value); break;
      case T.LONG: w.i64(value); break;
      case T.FLOAT: w.f32(value); break;
      case T.DOUBLE: w.f64(value); break;
      case T.BYTE_ARRAY:
        w.i32(value.length);
        w.chunks.push(new Uint8Array(value.buffer, value.byteOffset, value.byteLength).slice());
        break;
      case T.STRING: w.str(value); break;
      case T.LIST:
        w.u8(value.elementType);
        w.i32(value.items.length);
        for(const item of value.items) writePayload(w, value.elementType, item);
        break;
      case T.COMPOUND:
        for(const [name, entry] of value){
          w.u8(entry.type); w.str(name); writePayload(w, entry.type, entry.value);
        }
        w.u8(T.END);
        break;
      case T.INT_ARRAY: w.i32(value.length); for(const v of value) w.i32(v); break;
      case T.LONG_ARRAY: w.i32(value.length); for(const v of value) w.i64(v); break;
    }
  }

  function write(root){
    const w = new Writer();
    w.u8(root.type); w.str(root.name);
    writePayload(w, root.type, root.value);
    return w.toBytes();
  }

  // level.dat and playerdata are gzipped; tolerate raw NBT too.
  function inflate(bytes){
    return (bytes[0] === 0x1f && bytes[1] === 0x8b) ? pako.ungzip(bytes) : bytes;
  }

  window.NBT = {T, parse, write, inflate};
})();
